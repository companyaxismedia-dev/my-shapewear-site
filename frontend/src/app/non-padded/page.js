import { allProducts } from '@/data/products';

const NonPaddedPage = () => {
  const products = allProducts.filter(p => p.category === "non-padded");

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.id}>
          <img src={product.variants[0].images[0]} alt={product.name} />
          <h3>{product.name}</h3>
          <p>Starting from ₹{product.variants[0].price}</p>
        </div>
      ))}
    </div>
  );
};