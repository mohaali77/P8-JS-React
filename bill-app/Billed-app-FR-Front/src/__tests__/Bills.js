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

//Ici on va créer des test, on simulera une connexion en tant qu'employé
describe("Given I am connected as an employee", () => {
  //Lorsque je suis sur la page Bills
  describe("When I am on Bills Page", () => {
    //Ce test vérifie si l'icone dans la barre verticale est bien mis en valeur
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
    //Ce test vérifie si les notes de frais sont bien triés du plus récents au plus anciens
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    //Ce test vérifie si la fonction handleClickNewBill est bien appelé lors du clic sur le bouton "Nouvelle note de frais"
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
    //Ce test vérifie si la fonction handleClickIconEye est bien appelé, et que la modale s'affiche bien, lors du clic sur l'oeil.
    test("When I click on iconEye, then function handleClickIconEye should be called, and modale should appear", async () => {
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

//Lorsque qu'une erreur survient dans l'api, on effectue 2 tests différents, le test d'une erreur 404, et 500
describe("When an error occurs on API", () => {
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

  //test pour l'erreur 404
  test("fetches bills from an API and fails with 404 message error", async () => {
    mockStore.bills().list = jest.fn().mockRejectedValue(new Error("Erreur 404"));

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  //test pour l'erreur 500
  test("fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills().list = jest.fn().mockRejectedValue(new Error("Erreur 500"));

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});

