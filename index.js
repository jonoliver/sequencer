import React from "react";
import { render } from "react-dom";
import Main from "./js";
import "./scss";

render(<Main message="Hello World!" />, document.getElementById("app"));
