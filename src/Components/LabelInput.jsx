const LabelInput = ({ label, placeholder, type, onChange, name, value }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className=" font-medium text-lime-300 capitalize">{label}</label>
      <input
        type={type || "text"}
        placeholder={placeholder}
        className="rounded-md p-2 w-full border-slate-100 border text-sm outline-lime-500"
        onChange={onChange}
        name={name}
        value={value}
      />
    </div>
  );
};
export default LabelInput;
