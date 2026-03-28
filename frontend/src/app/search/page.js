import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import SearchResults from "./SearchResults";

export default function SearchPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Navbar />

      <Suspense
        fallback={
          <div className="section-padding">
            <div className="container-imkaa">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="product-card-imkaa">
                    <div className="skeleton" style={{ aspectRatio: "3 / 4" }} />
                    <div style={{ padding: 14 }}>
                      <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 12, width: "45%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}
