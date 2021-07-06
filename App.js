// @refresh reset

import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback  } from 'react';
import { Button, StyleSheet, Text, TextInput, View, LogBox } from 'react-native';
import * as firebase from 'firebase'
import 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GiftedChat } from 'react-native-gifted-chat';


const firebaseConfig = {
  apiKey: "AIzaSyDOe0xwyjeXGVxLa7QwsPqqf0mDNPQwock",
  authDomain: "chat-1d35d.firebaseapp.com",
  projectId: "chat-1d35d",
  storageBucket: "chat-1d35d.appspot.com",
  messagingSenderId: "342437241797",
  appId: "1:342437241797:web:fb13bae4131e7333b921ac"
}

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

LogBox.ignoreLogs(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {
  const [name, setname] = useState('')
  const [user, setuser] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    readUser()
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messagesFirestore = querySnapshot
          .docChanges()
          .filter(({type}) => type === 'added')
          .map(({doc}) => {
            const message = doc.data()
            return {...message, createdAt : message.createdAt.toDate()}
          }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      appenedMessages(messagesFirestore)
    })
    return () => unsubscribe()
  }, [])

  const appenedMessages = useCallback(
    (messages) => {
      setMessages((preMessages) => GiftedChat.append(preMessages, messages))
    },
    [messages],
  )

  async function readUser(){
    const user = await AsyncStorage.getItem('user')
    if (user) {
      setuser(JSON.parse(user))
    }
  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7)
    const user = {_id , name}
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setuser(user)
  }

  async function handleSend(messages){
    const writes = messages.map(m => chatsRef.add(m))
    await Promise.all(writes)
  }

  if (!user ) {
    <View style={styles.screen}>
        <TextInput 
          style={styles.inputField}
          placeholder='Please Enter The User Name'
          onChangeText={setname}
          value={name}
        />
        <Button style={styles.submitButton} title='Enter the chat' onPress={handlePress} />
      </View>
  }
  return  <GiftedChat messages={messages} user={user} onSend={handleSend} />
  
}

const styles = StyleSheet.create({
  screen : {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding : 30
  },
  inputField : {
    height : 50,
    width : '100%',
    borderWidth : 1,
    padding : 15,
    marginBottom : 20,
    borderColor : 'gray'
  },
  
  
});
