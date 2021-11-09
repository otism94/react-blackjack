const Button = ({
  title,
  onClick,
}: {
  title: string;
  onClick: React.Dispatch<React.SetStateAction<any>>;
}) => <button onClick={onClick}>{title}</button>;

export default Button;
