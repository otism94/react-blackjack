const Button = ({
  title,
  disabled = false,
  className,
  onClick,
}: {
  title: string;
  disabled: boolean;
  className: string;
  onClick: React.Dispatch<React.SetStateAction<any>>;
}) => (
  <button disabled={disabled} className={className} onClick={onClick}>
    {title}
  </button>
);

export default Button;
