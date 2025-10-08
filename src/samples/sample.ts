

// < Run javascript module in browser >

import { getFunctionDetails } from "../data/options/functions/site.data.options.functions.js";
import type { CustomFunctionsWithContext } from "../data/site.data.types.js";
import { fields } from "../helpers/helpers.general.js";

// var moduleData = `
//     function hello() { alert('hello'); }
//     export function callMe() { hello(); }
// `;

// var blob = new Blob([moduleData], { type: 'application/javascript' });
// var url = URL.createObjectURL(blob);

// var g = await import(url);
// g.callMe();

// URL.revokeObjectURL(url);

// </ Run javascript module in browser >


// < Testing creating module >

// import { createModule } from "../helpers/helpers.modules.js";
// var moduleData = "import {join} from 'path'; import { tmpdir } from 'os'; function hello() { console.log(join(tmpdir(), '12345.txt')); }; export function callMe() { hello(); }";
// var r = await createModule(moduleData);
// r?.callMe();

// </ Testing creating module >


// < Run javascript functions in browser >


// var declaredFunctions = {}; 
// for (var i = 0; i < functions.length; i++) { 
//      declaredFunctions[functions[i].name] = {
//          fn: new Function(functions[i].arguments, functions[i].body), 
//          args: functions[i].arguments.split(",").map(x => x.trim()) 
//      }    
// } 
// for (var i = 0; i < 10; i++) { 
//      var funcWithArgs = declaredFunctions["getCatholicEasterByYear"]; 
//      var args = []; 
//      for (var j = 0; j < funcWithArgs.args.length; j++) { 
//          switch(funcWithArgs.args[j]) { 
//              case 'year': args.push(2016+i); break; 
//              default: args.push(undefined); break; 
//          } 
//      } 
//      var date = funcWithArgs.fn.call(this, ...args); 
//      console.log(date); 
// }    


// </ Run javascript functions in browser >

// < Testing removing keys from type >

// // Mock functions
// function getStartDateAndEndDate() {}
// function validateAndCleanDate() {}

// // Define utilities with `as const`
// export const siteDataOptionsFunctionsUtilities = {
//     getStartDateAndEndDate: {
//         function: getStartDateAndEndDate,
//         canBeAccessedFromOtherFunctions: false,
//     },
//     validateAndCleanDate: {
//         function: validateAndCleanDate,
//         canBeAccessedFromOtherFunctions: true,
//     },
// } as const;

// // Derive types
// type PublicKeys = {
//     [K in keyof typeof siteDataOptionsFunctionsUtilities]:
//     (typeof siteDataOptionsFunctionsUtilities)[K] extends { canBeAccessedFromOtherFunctions: true }
//     ? K
//     : never;
// }[keyof typeof siteDataOptionsFunctionsUtilities];

// type PublicFunctions = Pick<typeof siteDataOptionsFunctionsUtilities, PublicKeys>;

// // Now test
// const d: { [K in keyof PublicFunctions]: string } = {
//     validateAndCleanDate: ''
// };

// </ Testing removing keys from type >

// < Testing fields object helper function >

// console.log(Object.keys(fields<CustomFunctionsWithContext>({ context: '', functions: [] })));

// </ Testing fields object helper function >

// < Testing overriding toString on a parent class >

// class Test {
//     a = 3;
// }

// class TestB extends Test {

// }

// Test.prototype.toString = function(): string {
//     return `The number is: ${this.a}`;
// }

// var test = new TestB();
// console.log(""+test);

// </ Testing overriding toString on a parent class >

var func = () => { return !true || false || !!1 || 0; }

var x = func;

console.log(JSON.stringify(getFunctionDetails(x)));
