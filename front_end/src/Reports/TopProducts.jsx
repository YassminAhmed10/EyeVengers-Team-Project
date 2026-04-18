import React from 'react';

const TopProducts = ({ data }) => {
  // Handle empty or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Top Selling Products
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No product data available
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Top Selling Products
      </h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Sales</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, index) => (
              <tr key={index}>
                <td className="font-medium">{product.name}</td>
                <td>{product.sales} units</td>
                <td>EGP {product.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;

