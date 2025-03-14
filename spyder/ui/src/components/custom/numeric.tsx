interface TemperatureProps {
  temp: any;
}

/**
 * Numeric component that displays the temperature value.
 * 
 * @param {number} props.temp - The temperature value to be displayed.
 * @returns {JSX.Element} The rendered Numeric component.
 */
function Numeric({ temp }: TemperatureProps) {
  // TODO: Change the color of the text based on the temperature
  // HINT:
  //  - Consider using cn() from the utils folder for conditional tailwind styling
  //  - (or) Use the div's style prop to change the colour
  //  - (or) other solution

  // Justify your choice of implementation in brainstorming.md

  return (
    <div className={`text-foreground text-4xl font-bold ${(20 <= temp && temp <= 25) || (75 <= temp && temp <= 80)? 'text-yellow-500'
    : 20 < temp && temp < 80 ? 'text-green-500' :
    'text-red-500'}`}>
      {`${temp}°C`}
    </div>
  );
}

export default Numeric;
