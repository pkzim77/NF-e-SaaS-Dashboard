// Assinatura digital XML (XML-DSig enveloped) com o certificado A1, para eventos da SEFAZ.
// Lê a chave privada e o certificado de dentro do .pfx (node-forge) e assina com xml-crypto.
import fs from 'node:fs';
import forge from 'node-forge';
import { SignedXml } from 'xml-crypto';
import { config } from './client.js';

let material;
function getKeyMaterial() {
  if (material) return material;
  if (!config.certPath || !config.certPassword)
    throw new Error('CERT_PATH/CERT_PASSWORD ausentes no server/.env');

  const der = fs.readFileSync(config.certPath, 'binary');
  const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(der), config.certPassword);

  // A chave pode vir como pkcs8ShroudedKeyBag (mais comum) ou keyBag.
  const shrouded = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const plain = p12.getBags({ bagType: forge.pki.oids.keyBag });
  const keyBag = (shrouded[forge.pki.oids.pkcs8ShroudedKeyBag] || [])[0]
    || (plain[forge.pki.oids.keyBag] || [])[0];
  const certBag = (p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [])[0];
  if (!keyBag?.key || !certBag?.cert)
    throw new Error('Não foi possível extrair chave/certificado do .pfx (senha incorreta?).');

  const privateKey = forge.pki.privateKeyToPem(keyBag.key);
  const certDerB64 = forge.util.encode64(
    forge.asn1.toDer(forge.pki.certificateToAsn1(certBag.cert)).getBytes()
  );
  material = { privateKey, certDerB64 };
  return material;
}

// Assina o <evento> (enveloped + C14N + SHA-1) referenciando o Id do <infEvento>.
// Devolve o XML do evento já com o bloco <Signature> após o <infEvento>.
export function assinarEvento(xml) {
  const { privateKey, certDerB64 } = getKeyMaterial();
  const sig = new SignedXml({
    privateKey,
    signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    getKeyInfoContent: () => `<X509Data><X509Certificate>${certDerB64}</X509Certificate></X509Data>`,
  });
  sig.addReference({
    xpath: "//*[local-name(.)='infEvento']",
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
  });
  sig.computeSignature(xml, {
    location: { reference: "//*[local-name(.)='infEvento']", action: 'after' },
  });
  return sig.getSignedXml();
}
