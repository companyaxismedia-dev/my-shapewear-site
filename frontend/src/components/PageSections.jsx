"use client";

import SectionRenderer from "./SectionRenderer";

export default function PageSections({
  sections = [],
  compact = false,
}) {
  if (!sections?.length) return null;

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer
          key={section._id}
          section={section}
          compact={compact}
        />
      ))}
    </div>
  );
}