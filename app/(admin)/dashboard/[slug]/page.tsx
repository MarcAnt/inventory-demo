const DetailsProduct = ({ params }: { params: { slug: string } }) => {
  //   const { data: product, isLoading, error } = useQuery({
  //     queryKey: ["product", params.slug],
  //     queryFn: () => getProductById(params.slug),
  //   });

  //   if (isLoading) return <div>Loading...</div>;
  //   if (error) return <div>Error: {error.message}</div>;

  return <div>{params.slug}</div>;
};
