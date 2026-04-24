import { Helmet } from "react-helmet-async";

const SITE_NAME = "Val d'Yerres Handball";
const BASE_URL = "https://www.valdyerreshandball.fr";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string | null;
  description?: string;
  canonical?: string;
  schema?: object;
  breadcrumb?: BreadcrumbItem[];
}

export default function SEO({ title, description, canonical, schema, breadcrumb }: SEOProps) {
  const fullTitle = title ? `${title} – ${SITE_NAME}` : `${SITE_NAME} – Club de Handball`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  const breadcrumbSchema = breadcrumb && breadcrumb.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumb.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${BASE_URL}${item.url}`,
        })),
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
