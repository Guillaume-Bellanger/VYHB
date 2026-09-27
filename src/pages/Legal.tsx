import { useSiteContent } from "@/hooks/useSiteContent";

// Mêmes valeurs de repli que la page Contact
const FALLBACK_EMAIL = "vyhandball@gmail.com";
const FALLBACK_ADRESSE = "La Halle des Sports, Boussy-Saint-Antoine";

const CREATEUR_NOM = "Guillaume Bellanger";
const CREATEUR_EMAIL = "Guillaume.bellanger.pro@gmail.com";
const CREATEUR_SITE = "https://www.guillaumebellanger.fr";

const linkClass = "text-foreground underline underline-offset-2 hover:text-primary transition-colors";

const Legal = () => {
  const { get } = useSiteContent();
  const email = get<string>("contact.email", FALLBACK_EMAIL);
  const adresse = get<string>("contact.adresse_gymnase", FALLBACK_ADRESSE);

  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl">
        <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mb-8">Mentions légales</h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">Éditeur du site</h2>
            <p>
              Val d'Yerres Handball — Association loi 1901<br />
              {adresse}<br />
              Email : <a href={`mailto:${email}`} className={linkClass}>{email}</a><br />
              Téléphone : <a href="tel:+33675264358" className={linkClass}>06 75 26 43 58</a>
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">Directeur de la publication</h2>
            <p>{CREATEUR_NOM}</p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">Conception et réalisation</h2>
            <p>
              Site conçu et développé par {CREATEUR_NOM}<br />
              Site : <a href={CREATEUR_SITE} target="_blank" rel="noopener noreferrer" className={linkClass}>guillaumebellanger.fr</a><br />
              Email : <a href={`mailto:${CREATEUR_EMAIL}`} className={linkClass}>{CREATEUR_EMAIL}</a>
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">Hébergement</h2>
            <p>o2switch — 222-224 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand, France<br />Tél : 04 44 44 60 40</p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">Propriété intellectuelle</h2>
            <p>L'ensemble du contenu de ce site (textes, images, vidéos) est la propriété exclusive du Val d'Yerres Handball, sauf mention contraire. Toute reproduction est interdite sans autorisation préalable.</p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">Données personnelles</h2>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ce droit, contactez-nous à <a href={`mailto:${email}`} className={linkClass}>{email}</a>.</p>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">Cookies</h2>
            <p>Ce site n'utilise pas de cookies de suivi ni de publicité. Seuls des cookies techniques nécessaires au fonctionnement du site peuvent être utilisés.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Legal;
