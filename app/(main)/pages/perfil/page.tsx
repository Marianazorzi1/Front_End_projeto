/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Projeto } from '@/types';
import { PerfilService } from '@/service/PerfilService';

const Perfil = () => {
    let perfilVazio: Projeto.Perfil = {
        id: 0,
        descricao: '',
    };
    
    const [perfis, setPerfis] = useState<Projeto.Perfil[] | null>(null);
    const [perfilDialog, setPerfilDialog] = useState(false);
    const [deletePerfilDialog, setDeletePerfilDialog] = useState(false);
    const [deletePerfisDialog, setDeletePerfisDialog] = useState(false);
    const [perfil, setPerfil] = useState<Projeto.Perfil>(perfilVazio);
    const [selectedPerfis, setSelectedPerfis] = useState<Projeto.Perfil[]>([]);
    const [submitted, setSubmitted] = useState(false); 
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const perfilServiceInstance = useMemo(() => new PerfilService(), []);

    useEffect(() => {
        if (!perfis) {
            perfilServiceInstance.listarTodos()
                .then((response) => {
                    console.log(response.data);
                    setPerfis(response.data);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [perfilServiceInstance, perfis]);

    const openNew = () => {
        setPerfil(perfilVazio);
        setSubmitted(false);
        setPerfilDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPerfilDialog(false);
    };

    const hideDeletePerfilDialog = () => {
        setDeletePerfilDialog(false);
    };

    const hideDeletePerfisDialog = () => {
        setDeletePerfisDialog(false);
    };

    const savePerfil = () => {
        setSubmitted(true);
        if (!perfil.id) {
            perfilServiceInstance.inserir(perfil)
                .then((response) => {
                    setPerfilDialog(false);
                    setPerfil(perfilVazio);
                    setPerfis(null);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso',
                        detail: 'Perfil cadastrado com Sucesso',
                    });
                })
                .catch((error) => {
                    console.log(error.data.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Há algo errado com o Perfil, verifique'
                    });
                });
        } else {
            perfilServiceInstance.alterar(perfil)
                .then((response) => {
                    setPerfilDialog(false);
                    setPerfil(perfilVazio);
                    setPerfis(null);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso',
                        detail: 'Perfil alterado com Sucesso',
                    });
                }).catch((error) => {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Há algo errado com o perfil, verifique'
                    });
                });
        }
    };

    const editPerfil = (perfil: Projeto.Perfil) => {
        setPerfil({ ...perfil });
        setPerfilDialog(true);
    };

    const confirmDeletePerfil = (perfil: Projeto.Perfil) => {
        setPerfil(perfil);
        setDeletePerfilDialog(true);
    };

    const deletePerfil = () => {
        if (perfil.id) {
            perfilServiceInstance.excluir(perfil.id).then((response) => {
                setPerfil(perfilVazio);
                setDeletePerfilDialog(false);
                setPerfis(null);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Perfil Deletado com sucesso',
                    life: 3000
                });
            }).catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Ops, algo errado ao tentar deletar o Perfil, verifique',
                    life: 3000
                });
            });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeletePerfisDialog(true);
    };

    const deleteSelectedPerfis = () => {
        Promise.all(selectedPerfis.map(async (_perfil) => {
            if (_perfil.id) {
                await perfilServiceInstance.excluir(_perfil.id);
            }
        })).then(() => {
            setPerfis(null);
            setSelectedPerfis([]);
            setDeletePerfisDialog(false);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Perfis Deletados com sucesso',
                life: 3000
            });
        }).catch(() => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao Deletar Perfis',
                life: 3000
            });
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setPerfil(prevPerfil => ({
            ...prevPerfil,
            [name]: val,
        }));
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedPerfis || !(selectedPerfis as any).length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData: Projeto.Perfil) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
        );
    };

    const descricaoBodyTemplate = (rowData: Projeto.Perfil) => {
        return (
            <>
                <span className="p-column-title">Descrição</span>
                {rowData.descricao}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Projeto.Perfil) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editPerfil(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeletePerfil(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Perfis</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const perfilDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={savePerfil} />
        </>
    );

    const deletePerfilDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeletePerfilDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deletePerfil} />
        </>
    );

    const deletePerfisDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeletePerfisDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedPerfis} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable ref={dt} value={perfis} selection={selectedPerfis} onSelectionChange={(e) => setSelectedPerfis(e.value)}
                        dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        globalFilter={globalFilter} header={header} responsiveLayout="scroll">
                        <Column selectionMode="multiple" exportable={false}></Column>
                        <Column field="id" header="Código" body={idBodyTemplate} sortable style={{ minWidth: '12rem' }}></Column>
                        <Column field="descricao" header="Descrição" body={descricaoBodyTemplate} sortable style={{ minWidth: '16rem' }}></Column>
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                    </DataTable>

                    <Dialog visible={perfilDialog} style={{ width: '450px' }} header="Cadastro de Perfis" modal className="p-fluid" footer={perfilDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="descricao">Descrição</label>
                            <InputText id="descricao" value={perfil.descricao} onChange={(e) => onInputChange(e, 'descricao')} required autoFocus className={classNames({ 'p-invalid': submitted && !perfil.descricao })} />
                            {submitted && !perfil.descricao && <small className="p-error">A descrição é obrigatória.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePerfilDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deletePerfilDialogFooter} onHide={hideDeletePerfilDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {perfil && <span>Tem certeza que deseja deletar o perfil <b>{perfil.descricao}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePerfisDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deletePerfisDialogFooter} onHide={hideDeletePerfisDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {perfil && <span>Tem certeza que deseja deletar os perfis selecionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
