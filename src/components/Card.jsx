import { splitProps } from "solid-js";
import { tilt } from "../lib/tilt";
import "./Card.css";

export default function Card(props) {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div class={`neo-card ${local.class || ""}`} use:tilt {...others}>
      {local.children}
    </div>
  );
}
