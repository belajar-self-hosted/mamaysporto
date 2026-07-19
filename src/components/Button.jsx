import { splitProps } from "solid-js";
import "./Button.css";

export default function Button(props) {
  const [local, others] = splitProps(props, ["children", "variant", "class"]);
  
  const variantClass = () => {
    switch (local.variant) {
      case "primary": return "btn-primary";
      case "secondary": return "btn-secondary";
      case "accent": return "btn-accent";
      case "live": return "btn-live";
      default: return "btn-default";
    }
  };

  return (
    <button class={`neo-btn ${variantClass()} ${local.class || ""}`} {...others}>
      {local.children}
    </button>
  );
}
