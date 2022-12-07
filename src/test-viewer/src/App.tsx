import React, {useState} from "react";
import logo from "./logo.svg";
import "./App.css";
import {FileUploader} from "react-drag-drop-files";

function App() {
    const [files, setFiles] = useState<File[]>([]);
    const [tArr, setTArr] =  useState([1]);

    const handleChange = (file: File) => {
        const form = new FormData();
        form.append("file", file);
        form.append('room', '1234');
        console.log(files);

        console.log(form);
        // fetch("http://localhost:3000/upload?room=1234", {
        //     method: "PUT",
        //     body: form,
        // });
    };

    const test = () => {
        console.log(tArr);
        setTArr(old => {
            const newArr = [...old];
            newArr.push(123);
            return newArr;
        })
    }

    return (
        <div className="App">
            <FileUploader handleChange={handleChange} name="file" />
            <a href="https://jcopy-storage.s3.ap-northeast-2.amazonaws.com/1234" download>download</a>
            <div>
                {files.map((item) => {
                    debugger;
                    return <div key={Math.random()}>{item.name}</div>;
                })}
            </div>
                <div onClick={test}>{'asdf'}</div>
            <div>
                {
                    tArr.map(item => {
                        return (<div key={Math.random()}>{item}</div>);
                    })
                }
            </div>
        </div>
    );
}

export default App;
