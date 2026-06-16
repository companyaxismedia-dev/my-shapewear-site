import FaqWrapper from "./FaqWrapper";

export const metadata = {
    title: "Frequently Asked Questions",
    description:
        "Find answers to common questions about Imkaa's ethnic wear collection, ordering process, store location, sizes, returns, exchanges, and more.",

    keywords: [
        "Imkaa FAQ",
        "ethnic wear FAQs",
        "kurti shop Dwarka FAQ",
        "women ethnic wear questions",
        "party wear suits FAQ",
        "returns and exchange policy",
        "ladies wear shop Dwarka",
        "Imkaa customer support",
        "ethnic wear store Delhi",
        "kurti size guide",
    ],

    alternates: {
        canonical: "/faq",
    },

    openGraph: {
        title: "FAQ | Imkaa",
        description:
            "Get answers to frequently asked questions about products, orders, sizing, returns, exchanges, and shopping at Imkaa.",
        url: "https://www.imkaa.com/faq",
        siteName: "Imkaa",
        locale: "en_IN",
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Imkaa FAQ",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "FAQ | Imkaa",
        description:
            "Frequently asked questions about shopping at Imkaa.",
        images: ["/og-image.png"],
    },

    robots: {
        index: true,
        follow: true,
    },
};

export default function FAQPage() {

    return (
        <>
            <FaqWrapper />
        </>
    );

}