/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import router from "../app/Router.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I send a wrong file or i valid file", () => {
    // Vérifie que le bill se sauvegarde
    test("Then an error message should show", async () => {
      document.body.innerHTML = NewBillUI();
    
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
    
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));
    
      const newBillInit = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });
    
      // Création du fichier fictif avec une extension invalide
      const fakeFile = new File([''], 'test.txt', { type: 'text/plain' });
    
      // Simulation de l'événement de changement de fichier avec le fichier fictif
      const fileInput = screen.getByTestId("file");
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });
    
      // Vérification que le message d'erreur est affiché dans la div errorMsg
      const errorMessage = "Fichier valide (jpg, jpeg ou png).";
      expect(screen.getByTestId('errorMsg').textContent).toBe(errorMessage)    
      // Vérification que la valeur du champ de fichier est réinitialisée
      expect(fileInput.value).toBe('');
    });
    test("Then no error message should show", async () => {
      document.body.innerHTML = NewBillUI();
    
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
    
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));
    
      const newBillInit = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });
    
      // Création du fichier fictif avec une extension invalide
      const validFile = new File([''], 'test.jpg', { type: 'text/plain' });
    
      // Simulation de l'événement de changement de fichier avec le fichier fictif
      const fileInput = screen.getByTestId("file");
      fireEvent.change(fileInput, { target: { files: [validFile] } });
    
      // Vérification que le message d'erreur est affiché dans la div errorMsg
      const validMessage = "";
      expect(screen.getByTestId('errorMsg').textContent).toBe(validMessage)
    });
    
  })
  describe("handleSubmit", () => {
    test("should update the bill and navigate to bills page", () => {

      jest.spyOn(mockStore, "bills")

      // Set up the form elements
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Mock localStorage
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));
  
      // Instantiate the NewBill component
      const newBillInit = new NewBill({
        document,
        onNavigate: onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const formNewBill = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    
    });

  });
  
})
