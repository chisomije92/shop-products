import path from "path";

// export default path.dirname(require.main!.filename);
const __dirname = path.resolve();
export default path.dirname(process.cwd());
