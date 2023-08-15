const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Invoices = require('../models/invoice');
const InvoicesDetail = require('../models/invoiceDetail');

let session = null;

router.use(express.json());

router.route('/')
    .get((req, res, next) => {
        const updated = req.query.updated;
        var fInvoicesDetail = null;
        
        console.log('updated', updated);
        InvoicesDetail.find()
            .then(invoicesDetail => {
                fInvoicesDetail = invoicesDetail;
                return Invoices.find();
            })
            .then(invoices => {
                console.log({ invoices: invoices, invoicesDetail: fInvoicesDetail });
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ invoices: invoices, invoicesDetail: fInvoicesDetail });
            }, (err) => next(err));
    })
    .post((req, res, next) => {
        mongoose.startSession()
        .then((_session) => session = _session)
        .then(() => session.startTransaction())
        .then(() => Invoices.insertMany(req.body.invoices, { ordered: true, session: session }))
        .then((resp) => console.log("RESP", resp))
        .then(() => InvoicesDetail.insertMany(req.body.invoicesDetail, { session: session }))
        .then((resp) => console.log("RESP", resp))
        .then(() => session.commitTransaction())
        .then(() => session.endSession())
        .then(() => {
            res.statusCode = 200;
            res.send()
        }).catch(err => next(err))
    })

module.exports = router;
