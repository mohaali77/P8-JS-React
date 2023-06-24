/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { ROUTES } from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";

jest.mock("../app/store", () => mockStore)

//Ici on va créer des test, on simulera une connexion en tant qu'employé, et l'envoi d'un fichier sur la page NewBill.
describe("Given I am connected as an employee", () => {
  describe("When I send a wrong file or a valid file on NewBill form", () => {
    // Le premier test, simulera l'envoi d'un fichier invalide, il vérifiera qu'un message d'erreur s'affiche bien.
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
    // Le second test, simulera l'envoi d'un fichier valide, il vérifiera qu'aucun message d'erreur ne s'affiche.
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
  /*Ici, c'est un test qui va vérifier que la fonction HandleSubmit est bien appelé, lorsque le formulaire 
  de la page "Nouvelle note de frais" est soumis. */
  describe("When I am on NewBill page and complete the form", () => {
    test("Then when i submit the form, handleSubmit function should be called ", () => {

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
    })
    
  })  
  //Lorsque qu'une erreur survient dans l'api, on effectue 2 tests différents, le test d'une erreur 404, et 500
  describe("When an error occurs on API", () => {
    //test pour l'erreur 404
    test("Add bills from an API and fails with 404 message error", async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
  
      document.body.innerHTML = NewBillUI();
  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const postSpy = jest.spyOn(console, "error");
  
      const store = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
        update: jest.fn(() => Promise.reject(new Error("404"))),
      };
  
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      newBill.isImgFormatValid = true;
  
      // Submit form
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
  
      fireEvent.submit(form);
      await new Promise(process.nextTick);
      expect(postSpy).toBeCalledWith(new Error("404"));
    });
  
    //test pour l'erreur 500
    test("Add bills from an API and fails with 500 message error", async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
  
      document.body.innerHTML = NewBillUI();
  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const postSpy = jest.spyOn(console, "error");
  
      const store = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
        update: jest.fn(() => Promise.reject(new Error("500"))),
      };
  
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      newBill.isImgFormatValid = true;
  
      // Submit form
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
  
      fireEvent.submit(form);
      await new Promise(process.nextTick);
      expect(postSpy).toBeCalledWith(new Error("500"));
    });
  });
})
