export default interface IUpdateFiles {
    id: string;
    roomId: string;
    clientId: string[];
    fileIds: string[];
    leftStorage: number;
}