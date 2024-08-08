import React, {useEffect, useState} from 'react'
import {newFilterProps} from "../search/filters";

export function newFilters(filtersParam) {
    let filters = [];
    ['scientificname', 'datecollected', 'country'].forEach(item => {
        filters.push(newFilterProps(item));
    });
    return filters;
}
// Call the function to load the module dynamically
const Chat = ({searchChange}) => {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        // Create script element
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/deep-chat@1.4.11/dist/deepChat.bundle.js';
        script.id = 'deepChatScript';

        // Attach onload listener
        script.onload = () => {
            setIsScriptLoaded(true);
        };

        // Append script to head
        document.head.appendChild(script);

        // Cleanup: remove the script when the component is unmounted
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (isScriptLoaded) {
            const chatRef = document.getElementById('chat')
            const shadowRoot = chatRef.shadowRoot
            const containerElement = shadowRoot.querySelector('#container')

            containerElement.style.height = '490px'
            containerElement.style.width = '399px'
            containerElement.style.fontSize = '1.5rem'

            chatRef.setAttribute(
                "introMessage",
                "Welcome to iDigBio, how can I assist you?"
            )

            chatRef.initialMessages = [
                { role: "ai", text: "Welcome to iDigBio, how can I assist you?" },
            ];

            chatRef.setAttribute(
                "chatStyle",
                '{ "width": "448px", "height": "490px"}'
            )

            chatRef.onNewMessage = (message) => {
                console.log(message.message.text)
                const regex = /{.*}/;
                const match = message.message.text.match(regex);

                if (match) {
                    const jsonString = match[0];
                    try {
                        // Parse the JSON string to an object
                        const jsonObject = JSON.parse(jsonString);

                        // Extract the 'rq' object
                        const rq = jsonObject.rq;

                        // Transform the 'rq' object into the desired array of objects
                        const transformedArray = Object.entries(rq).map(([name, text]) => {
                            return {
                                name: name,
                                type: 'text', // Assuming 'type' is a static value for this example
                                text: text,
                                exists: false,
                                missing: false
                            };
                        });

                        console.log(transformedArray);
                        searchChange('filters', transformedArray)
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                    }
                } else {
                    console.log("No JSON found in the string.");
                }

            }


        }
    }, [isScriptLoaded])



    return (
        <div style={{display: 'flex', width: '100%', height: '100%'}}>
            {isScriptLoaded ? (
                // Render the deep-chat component when the script is loaded
                <deep-chat
                    id="chat"
                    request='{
                        "url": "http://localhost:8080/chat",
                        "method": "POST",
                        "headers": {"customName": "customHeaderValue"},
                        "additionalBodyProps": {"field": "value"}
                      }'

                ></deep-chat>
            ) : (
                // Show a loading indicator or message
                <p>Loading Deep Chat...</p>
            )}
        </div>
    )
}
export default Chat;