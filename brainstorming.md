# Brainstorming

This file is used to document your thoughts, approaches and research conducted across all tasks in the Technical Assessment.

## Firmware

## Spyder

1.
npm install --save-dev nodemon 
and then change the dockerfile to be CMD["npm", "run", "dev"]
honestly don't really know why this worked lol I read the nodemon docs and it said that I should change the scripts:dev: value within the package.json to be nodemon -L. But this didn't work, I'm pretty sure that nextjs has its own built in system for rerendering the page when a change is made to the code which nodemon was conflicting with. Pretty sure my current way of doing it doesn't actually use nodemon but it achieves the same thing. Also nodemon was already installed in 'streaming-service' so I didn't have to do anything there.

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