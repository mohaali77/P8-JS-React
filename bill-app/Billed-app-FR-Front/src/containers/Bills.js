import { ROUTES_PATH } from '../constants/routes.js';
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";
import { bills } from '../fixtures/bills.js';

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon));
    });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill']);
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5);
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`);
    $('#modaleFile').modal('show');
  }

getBills = () => {
  bills.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(bills);
  if (this.store) {
    return this.store
      .bills()
      .list()
      .then(snapshot => {
        let bills = snapshot.map(doc => ({
          ...doc,
          date: new Date(doc.date), // Convertir la date en objet Date
          status: formatStatus(doc.status)
        }));

        // Trier les factures par date du plus récent au plus ancien
        bills.sort((a, b) => b.date - a.date);

        // Formater les dates après le tri
        bills = bills.map(doc => ({
          ...doc,
          date: formatDate(doc.date)
        }));

        console.log('length', bills.length);
        return bills;
      });
  }
};
}



