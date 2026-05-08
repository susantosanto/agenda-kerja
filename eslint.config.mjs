export default [
  {
    ignores: [".next/**", "out/**", "build/**", "public/uploads/**"],
  },
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "no-unused-vars": "off",
      "no-explicit-any": "off",
    },
  },
]
