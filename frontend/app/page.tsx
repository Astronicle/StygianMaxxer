import Image from "next/image";
import HeroBg from "./assets/hero_bg.png";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div
        className="hero min-h-screen no-offset -mt-28"
        style={{
          backgroundImage: `url(${HeroBg.src})`,
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">StygianMaxxer</h1>
            <p className="mb-5">Unofficial Stygian Onslaught database.</p>
            <Link href="/post">
              <button className="btn btn-primary">Browse</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
