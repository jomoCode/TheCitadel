import Script from "next/script";

const GTM_ID = /^GTM-[A-Z0-9]+$/;

/**
 * Loads Google Tag Manager on the public website only (never the admin, resident or gate apps) when
 * NEXT_PUBLIC_GTM_ID is set. GA4 and any other tags are then managed inside Tag Manager, without code changes.
 * The ID is validated so a typo can't inject anything into the page.
 */
export function GoogleTagManager() {
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  if (!id || !GTM_ID.test(id)) return null;
  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`}
      </Script>
      <noscript>
        <iframe src={`https://www.googletagmanager.com/ns.html?id=${id}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" />
      </noscript>
    </>
  );
}
