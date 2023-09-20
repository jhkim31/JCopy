export default interface IUpdateFiles {
    id: string;
    roomId: string;
    clientSession: string[];
    fileIds: string[];
    leftStorage: number;
}