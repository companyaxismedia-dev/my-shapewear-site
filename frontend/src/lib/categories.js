import { API_BASE } from "@/lib/api";

export const flattenCategoryTree = (nodes = [], depth = 0, parentPath = []) =>
  nodes.flatMap((node) => {
    const pathSegments = [...parentPath, node.slug];
    const normalizedNode = {
      ...node,
      depth,
      pathSegments,
      href: `/${pathSegments.join("/")}`,
    };

    return [
      normalizedNode,
      ...flattenCategoryTree(node.subCategories || [], depth + 1, pathSegments),
    ];
  });

export const collectDescendantSlugs = (node) => {
  if (!node) return [];

  return [
    node.slug,
    ...(node.subCategories || []).flatMap((child) => collectDescendantSlugs(child)),
  ];
};

export const collectCategoryFilterKeys = (node) => {
  if (!node) return [];

  const keys = new Set([node.slug, node.name].filter(Boolean));
  (node.subCategories || []).forEach((child) => {
    collectCategoryFilterKeys(child).forEach((item) => keys.add(item));
  });

  return [...keys];
};

export const findCategoryBySegments = (nodes = [], segments = []) => {
  if (!segments.length) return null;

  let currentNodes = nodes;
  let currentNode = null;

  for (const segment of segments) {
    currentNode = currentNodes.find((node) => node.slug === segment) || null;
    if (!currentNode) return null;
    currentNodes = currentNode.subCategories || [];
  }

  return currentNode;
};

export const filterNavbarCategories = (nodes = []) =>
  nodes
    .filter((node) => node?.showInNavbar !== false)
    .map((node) => ({
      ...node,
      subCategories: filterNavbarCategories(node.subCategories || []),
    }));

export const fetchCategoryTree = async () => {
  const res = await fetch(`${API_BASE}/api/categories`, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to load categories");
  }

  return data.tree || [];
};
