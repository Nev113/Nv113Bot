import venom from "venom-bot";
import data from "./data.json" assert {type: "json"};
import fs from "fs";

const startSession = async () => {
    venom.create({session: "nevo-sessions"})
    .then((client) => {
        start(client)
    }
    )
}

let already = []

startSession();

const start = async (client) => {
    client.onStreamChange((state) => {
        if (state === 'PAUSED' || state === 'STOPPED') {
            if (mediaBuffer && mediaType && mediaFrom && mediaTo) {
                client.sendMediaMessage(mediaTo, mediaBuffer, mediaType, mediaCaption)
                    .then((result) => {
                        console.log('Media successfully sent to receiver:', result);
                        mediaBuffer = null;
                        mediaType = null;
                        mediaCaption = null;
                        mediaFrom = null;
                        mediaTo = null;
                    })
                    .catch((error) => {
                        console.error('Failed to send media to receiver:', error);
                    });
            }
        }
    });
    client.onMessage((message) => {
        console.log(message)
        if (message.mediaData.type == "sticker" || message.mediaData.type == "image"){
            if (already.length !== 0){
                already.forEach((item) => {
                   if (item.nomor == message.from || item.nomorPasangan == message.from){
                    mediaBuffer = message.mediaData;
                    mediaType = message.type;
                    mediaCaption = message.caption;
                    mediaFrom = message.from === item.nomorPasangan ? item.nomorPasangan : item.nomor;
                    mediaTo = message.from === item.nomorPasangan ? item.nomorPasangan : item.nomor;
                    console.log(mediaBuffer, mediaCaption, mediaFrom, mediaTo)
                    if (item.nomorPasangan== message.from){
                        client.sendMediaMessage(item.nomor, mediaData, type, caption)
                    }else{
                        client.sendMediaMessage(item.nomorPasangan, mediaData, type, caption)
                    }
                   }
                })
            }
        }
        if (message.body){
            if (already.length != 0){
                already.forEach((datamsg) => {
                    if (datamsg.nomor === message.from || datamsg.nomorPasangan === message.from){
                        console.log(message.from)
                        if (datamsg.already){
                            already.forEach((item) => {
                                if (item.nomor === message.from){
                                    console.log(item.nomor, item.nomorPasangan)
                                    if (message.body === ".stop"){
                                        already.splice(already.indexOf(item), 1)
                                        client.sendText(item.nomorPasangan, "Chat telah dihentikan");
                                        client.sendText(item.nomor, "Chat telah dihentikan");
                                    }else{
                                        client.sendText(item.nomorPasangan, message.body);
                                    }
                                    
                                }else if (item.nomorPasangan === message.from){
                                    client.sendText(item.nomor, message.body);
                                }
                            })
                        }
                    }else{
                        const splittedCommand = message.body.split(" ")[0];
                        if (splittedCommand === ".anon"){
                                client.sendText(message.from, "untuk memulai anon chat silahkan beri .mulai / .start");
                        }
                        if (splittedCommand === ".mulai" || splittedCommand === ".start"){
                            console.log(splittedCommand)
                            startChat(message, client);
                        }
                        if (splittedCommand == ".stop"){
                            if (datamsg.already){
                                already.forEach((item) => {
                                    if (item.nomor === message.from){
                                        already.splice(already.indexOf(item), 1)
                                        client.sendText(item.nomorPasangan, "Chat telah dihentikan");
                                        client.sendText(item.nomor, "Chat telah dihentikan");
                                    }else if (item.nomorPasangan === message.from){
                                        client.sendText(item.nomorPasangan, "Chat telah dihentikan");
                                        client.sendText(item.nomor, "Chat telah dihentikan");
                                    }
                                })
                            }else{
                                client.sendText(message.from, "Anda belum memulai chat");
                            }
                        }
                    }
                })
            }else{
                const splittedCommand = message.body.split(" ")[0];
                        if (splittedCommand === ".anon"){
                                client.sendText(message.from, "untuk memulai anon chat silahkan beri .mulai / .start");
                        }
                        if (splittedCommand === ".mulai" || splittedCommand === ".start"){
                            startChat(message, client);
                        }
                        if (splittedCommand == ".stop"){
                                already.forEach((item) => {
                                    if (item.nomor === message.from){
                                        already.splice(already.indexOf(item), 1)
                                        client.sendText(item.nomorPasangan, "Chat telah dihentikan");
                                        client.sendText(item.nomor, "Chat telah dihentikan");
                                    }else if (item.nomorPasangan === message.from){
                                        client.sendText(item.nomorPasangan, "Chat telah dihentikan");
                                        client.sendText(item.nomor, "Chat telah dihentikan");
                                    }else{
                                        client.sendText(message.from, "Anda belum memulai chat");
                                    }
                                })
                            }
            }
        }
    });
}

function startChat(message, clients) {
    console.log(data, already)
    if (data.length > 0){
        data.forEach((item) => {
        if (item.nomor === message.from || item.nomorPasangan == message.from){
            clients.sendText(message.from, "Anda sudah memulai chat");
        }else{
            clients.sendText(message.from, "Mencari Lawan Chat");
        const dataPengguna = {
            nomor: message.from,
            already: false
        }
        data.push(dataPengguna);
        console.log(data)
        if (data.length == 1){
            clients.sendText(message.from, "Tunggu lawan chat ditemukan...");
        }else if (data.length == 2){
            const dataP = {
                nomor: data[0].nomor,
                nomorPasangan : message.from,
                already: true
            }
            already.push(dataP)
            data.splice(data.indexOf(data[0]),1)
        }else if (data.length > 2){
            const randomIndex = Math.floor(Math.random() * data.length);
            const dataP = {
                nomor: data[randomIndex].nomor,
                nomorPasangan: message.from,
                already: true
            }
            already.push(dataP)
            console.log(data, already)
            data.splice(data.indexOf(data[randomIndex]), 1)
            data.splice(data.indexOf(dataPengguna), 1)
            data.forEach((item) => {
                if (item.nomor === message.from){
                    clients.sendText(message.from, "Anda sudah memulai chat");
                }else{
                    clients.sendText(item.nomor, "Anda sudah memulai chat");
                }
            })
        }
        }   
    })
    }else{
        clients.sendText(message.from, "Mencari Lawan Chat");
        const dataPengguna = {
            nomor: message.from,
            already: false
        }
        data.push(dataPengguna);
        console.log(data)
        if (data.length == 1){
            clients.sendText(message.from, "Tunggu lawan chat ditemukan...");
        }else if (data.length == 2){
            const dataP = {
                nomor: data[0].nomor,
                nomorPasangan : message.from,
                already: true
            }
            already.push(dataP)
            data.splice(data.indexOf(data[0]))
        }else if (data.length > 2){
            const randomIndex = Math.floor(Math.random() * data.length);
            const dataP = {
                nomor: data[randomIndex].nomor,
                nomorPasangan: message.from,
                already: true
            }
            already.push(dataP)
            console.log(data, already)
            data.splice(data.indexOf(data[randomIndex]), 1)
            data.splice(data.indexOf(dataPengguna), 1)
            data.forEach((item) => {
                if (item.nomor === message.from){
                    clients.sendText(message.from, "Anda sudah memulai chat");
                }else{
                    clients.sendText(item.nomor, "Anda sudah memulai chat");
                }
            })
        }
    }
}