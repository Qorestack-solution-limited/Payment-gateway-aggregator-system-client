const Button = ({ text, leftIcon, rightIcon, style, onClick }) => {
  return (
    <button
      class={`flex items-center justify-center gap-2 text-sm ${style} p-2 rounded-full gap-2 px-8 py-3 cursor-pointer`}
      onClick={onClick}>
      {leftIcon}
      {text}
      {rightIcon}
    </button>
  );
};
export default Button;
