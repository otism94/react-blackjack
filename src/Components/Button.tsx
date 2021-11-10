const Button = ({
  title,
  disabled = false,
  onClick,
}: {
  title: string;
  disabled: boolean;
  onClick: React.Dispatch<React.SetStateAction<any>>;
}) => (
  <button disabled={disabled} onClick={onClick}>
    {title}
  </button>
);

export default Button;
