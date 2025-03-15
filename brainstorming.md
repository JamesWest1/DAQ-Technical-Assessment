# Brainstorming

This file is used to document your thoughts, approaches and research conducted across all tasks in the Technical Assessment.

## Firmware
1.
I got part 1 working after a long time, most of the processing is handled by dbcppp library, just need to order the bytes properly in the
uint8_t array that is passed to Decode(). Also in order to get docker to work with dbcppp we need to make sure that it installs libxml2 when it builds

2.
Low latency (allows multiple signals to be processed at a time, before signals would only be sent once at a time), realy time monitoring and data logging. Allows you to easily integrate new/different componenets (its scalable).
Reduced weight due to reduced wiring apparently?
Strong error detection, incorrect data is retransmitted

Maximum speed is limited to 1Mbit/second unless using CAN FD which enables 5 Mbit/second.
Higher maintance costs potentially

I believe Redback decided to use CAN mainly because of its reliability in data transfer and high speed. It also seems like its easier to integrate new components in CAN as opposed to other systems.


I chose this
https://www.st.com/en/microcontrollers-microprocessors/stm32f777ni.html

Listed as 13 USD on the same website that was linked on the TA, it meets all the requirements and doesn't really go beyond from what I can see. It's 14x14 mm. I chose this one because of its higher maximum temperature which I assume is something that's especially important for electric vehicles.



## Spyder

1.
npm install --save-dev nodemon
and then change the dockerfile to be CMD["npm", "run", "dev"]
added something in scripts:dev: in the package.json

2.
Looks like the data is being converted to a different form before its being sent, possibly being converted to a string thats the 
utf-8 encoding of the floating point number instead of the number itself. I could convert this string to the number that its meant to represent
but I'm not sure if this is sensible because in practice I assume these kinds of errors would likely be caused by a fault in the hardware (maybe?) and would just be giberish numbers like 14210.4124014. For now I'm going to disregard data of type string for the temp, probably
have another look at this later.

3.
need to somehow store all data in the past 5 seconds that exceeds the termperature limit of 80 so that we can print an error when there are too many readings that exceed this. In order to do this we can simply store a timestamp in an array each time we recieve a request that has a temperature over 80, whilst we do this we also remove all values in the array that are more than 5 seconds prior to this new timestamp. That way the array always holds the correct amount of exceeding temperature after each request. See example below:

current timestamps that were critical temp: [20,22,27]
and then we recieve a new value {temp:100.4, timestamp: 30}
because temp > 80 we add it to the array, therefore we now have [20,22,27,30]
now we need to remove old values in the array.
since 30 - 20 = 10 this happened 10 seconds ago so remove it
since 30 - 22 = 8 this happened 8 seconds ago so remove it
since 30 - 27 = 3 this happened 3 seconds ago < 5 so keep it
hence we are left with [27,30] after we recieve this packet
(note that the actual values we recieve are in ms not seconds)

4.
You can optionally specify a list of dependencies that when any of the values in this dependency list change, triggers the useEffect hook. The value of readyState changed but the useEffect hook wasn't triggered because readyState wasnt specified as a dependency. In order to fix this you just have to include it in the dependency list in the useEffect hook

5.
Implemented a graph that shows how the temperature is changing over time in a scatter plot
created an error message that appears within the card below the temp in red font when the temp has been critical for a period of time
implemented a light and dark mode button toggle (can be found in the top left next to the logo)

## Cloud