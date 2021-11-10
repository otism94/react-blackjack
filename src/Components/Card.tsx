const Card = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <div className="card">
      <img className="card-img" src={src} alt={alt} />
    </div>
  );
};

export default Card;
