/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import mockStore from "../__mocks__/store";
import {ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true);

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("When I click on button Newbill, Then function handleClickNewBill should be called", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const billsInit = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      }); 

      const handleClickNewBill = jest.fn((e) => billsInit.handleClickNewBill(e));
      const buttonNewBill = screen.getByTestId("btn-new-bill")
      buttonNewBill.addEventListener('click', handleClickNewBill)  
      fireEvent.click(buttonNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
      
    })
    test("When I click on iconEye, Then modale should appear", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const billsInit = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });
    
      const modale = document.getElementById("modaleFile");
      $.fn.modal = jest.fn(() => modale.classList.add("show"));
    
      const iconEyes = screen.getAllByTestId("icon-eye");
    
      iconEyes.forEach((eye) => {
        const handleClickIconEye = jest.fn(() => billsInit.handleClickIconEye(eye));
    
        eye.addEventListener("click", handleClickIconEye);
        userEvent.click(eye);
        expect(handleClickIconEye).toHaveBeenCalled();
        expect(modale.classList).toContain("show");
      });
    });
    
    
  })
  
  
})
describe("When Employee Navigate on Bills Dashbord", () => {
  beforeEach(() => {    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
  });

  test("fetches bills from an API and fails with 404 message error", async () => {
    mockStore.bills().list = jest.fn().mockRejectedValue(new Error("Erreur 404"));

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills().list = jest.fn().mockRejectedValue(new Error("Erreur 500"));

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});


