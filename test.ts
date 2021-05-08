import fs from "fs";
import protobufjs from "protobufjs/light";
import pako from "pako";
import desc from "./src/desc.json";

const Entity = protobufjs.Root.fromJSON(desc).lookupType("com.opensource.svga.MovieEntity");
const buffer = fs.readFileSync("./assets/ReadyGo.svga");
const data = Entity.decode(pako.inflate(buffer));
console.log(data);
