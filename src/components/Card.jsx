import { splitProps } from "solid-js";
import "./Card.css";

export default function Card(props) {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div class={`neo-card ${local.class || ""}`} {...others}>
      {local.children}
    </div>
  );
}
