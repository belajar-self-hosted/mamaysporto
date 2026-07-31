import { onMount, onCleanup, createSignal, Show } from "solid-js";
import { prefersReducedMotion } from "../lib/motion";
import "./HeroScene.css";

const ACCENT_HEX = [0xff5470, 0x00ebc7, 0xfde24f, 0xffffff];

/**
 * Showpiece Three.js: objek low-poly flat-shaded (tanpa lighting realistis) yang berputar
 * pelan + mengikuti mouse tipis. three.js di-dynamic-import supaya tidak membebani bundle utama,
 * dan di-skip total di layar kecil/touch — foto profil Hero tetap tampil sebagai fallback.
 */
export default function HeroScene() {
  let canvasRef;
  const [ready, setReady] = createSignal(false);

  const shouldRender = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    window.innerWidth >= 900;

  onMount(() => {
    if (!shouldRender()) return;
    setReady(true);

    let disposed = false;
    let renderer, geometry, edges, material, lineMaterial, rafId;
    let targetX = 0;
    let targetY = 0;
    const reduceMotion = prefersReducedMotion();

    const handlePointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetX = ny * 0.4;
      targetY = nx * 0.6;
    };

    onCleanup(() => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handlePointerMove);
      geometry?.dispose();
      edges?.dispose();
      material?.dispose();
      lineMaterial?.dispose();
      renderer?.dispose();
    });

    import("three")
      .then((THREE) => {
        if (disposed || !canvasRef) return;

        const size = canvasRef.clientWidth || 160;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 3.2;

        renderer = new THREE.WebGLRenderer({ canvas: canvasRef, alpha: true, antialias: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        geometry = new THREE.IcosahedronGeometry(1.15, 0).toNonIndexed();
        const position = geometry.attributes.position;
        const colorArray = [];
        const c = new THREE.Color();
        for (let i = 0; i < position.count; i += 3) {
          c.setHex(ACCENT_HEX[(i / 3) % ACCENT_HEX.length]);
          for (let v = 0; v < 3; v++) colorArray.push(c.r, c.g, c.b);
        }
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colorArray, 3));

        material = new THREE.MeshBasicMaterial({ vertexColors: true });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        edges = new THREE.WireframeGeometry(geometry);
        lineMaterial = new THREE.LineBasicMaterial({ color: 0x0b0c10 });
        mesh.add(new THREE.LineSegments(edges, lineMaterial));

        if (!reduceMotion) window.addEventListener("mousemove", handlePointerMove);

        const animateFrame = () => {
          if (disposed) return;
          if (!reduceMotion) {
            mesh.rotation.y += 0.004;
            mesh.rotation.x += (targetX - mesh.rotation.x) * 0.04;
            mesh.rotation.z += (targetY * 0.3 - mesh.rotation.z) * 0.04;
          }
          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animateFrame);
        };
        animateFrame();
      })
      .catch(() => {
        setReady(false);
      });
  });

  return (
    <Show when={ready()}>
      <canvas ref={canvasRef} class="hero-scene-canvas" aria-hidden="true" />
    </Show>
  );
}
