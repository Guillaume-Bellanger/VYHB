const Legal = () => (
  <section className="section-padding">
    <div className="container-narrow max-w-3xl">
      <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mb-8">Mentions légales</h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-2">Éditeur du site</h2>
          <p>Handball Club — Association loi 1901<br />12 Rue du Sport, 75000 Paris<br />Email : contact@handball-club.fr<br />Téléphone : 01 23 45 67 89</p>
        </div>

        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-2">Directeur de la publication</h2>
          <p>M. / Mme [Nom du Président(e)]</p>
        </div>

        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-2">Hébergement</h2>
          <p>o2switch — 222-224 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand, France<br />Tél : 04 44 44 60 40</p>
        </div>

        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-2">Propriété intellectuelle</h2>
          <p>L'ensemble du contenu de ce site (textes, images, vidéos) est la propriété exclusive du Handball Club, sauf mention contraire. Toute reproduction est interdite sans autorisation préalable.</p>
        </div>

        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-2">Données personnelles</h2>
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ce droit, contactez-nous à contact@handball-club.fr.</p>
        </div>

        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-2">Cookies</h2>
          <p>Ce site n'utilise pas de cookies de suivi ni de publicité. Seuls des cookies techniques nécessaires au fonctionnement du site peuvent être utilisés.</p>
        </div>
      </div>
    </div>
  </section>
);

export default Legal;
