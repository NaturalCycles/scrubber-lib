import {scrub} from "./scrubber";
import {configMock, configMock2} from "./test/scrubber.mock";
import {deepFreeze} from "@naturalcycles/js-lib";

test ('test1', () => {
  const data = [{pw: 'bla', nma: 'asd'}]
  deepFreeze(data) // Ensure data doesnt mutate
  const result = scrub(data, configMock())
  expect (result).toEqual([{pw: 'abc', nma: 'asd'}])

})

test ('test1.2', () => {
  const data = [{pw: 'bla', nma: 'asd', email: 'real@email.com'}]
  deepFreeze(data) // Ensure data doesnt mutate
  const result = scrub(data, configMock2())
  expect (result).toEqual([{pw: 'bla', nma: 'asd', email: 'test@nc.com'}])

})

test ('test2', () => {
  const result = scrub([], configMock())
  expect (result).toEqual([])
})
