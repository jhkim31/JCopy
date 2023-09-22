import path from "path";

export default function staticPath (relative_path: string) {
    return path.resolve(process.cwd(), relative_path);
}
