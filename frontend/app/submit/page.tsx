import React from "react";

function page() {
  return (
    <>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Post Title</legend>
        <input type="text" className="input" placeholder="Kazuha Hypercarry clear" />
        <p className="label">Mandatory</p>
      </fieldset>
    </>
  );
}

export default page;
