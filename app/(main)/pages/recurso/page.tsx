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
import { RecursoService } from '@/service/RecursoService';


/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
const Recurso = () => {
    let recursoVazio: Projeto.Recurso = {
        id: 0,
        nome: '',
        chave: '', 
    };
    
    const [recursos, setRecursos] = useState<Projeto.Recurso[] | null>(null);
    const [recursoDialog, setRecursoDialog] = useState(false);
    // const [recursoDialogFooter, setRecursoDialogFooter] = useState(false);
    // const [deleteRecursoDialogFooter, setDeleteRecursoDialogFooter] = useState(false);
    // const [deleteRecursosDialogFooter, setDeleteRecursosDialogFooter] = useState(false);
    const [deleteRecursoDialog, setDeleteRecursoDialog] = useState(false);
    const [deleteRecursosDialog, setDeleteRecursosDialog] = useState(false);
    const [recurso, setRecurso] = useState<Projeto.Recurso>(recursoVazio);
    const [selectedRecursos, setSelectedRecursos] = useState<Projeto.Recurso[]>([]);
    const [submitted, setSubmitted] = useState(false); 
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const recursoService =useMemo(() => new RecursoService(),[])

    useEffect(() => {

        if (!recursos) {
            recursoService.listarTodos()
                .then((response) => {
                    console.log(response.data);
                    setRecursos(response.data);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [recursoService, recursos]);




    const openNew = () => {
        setRecurso(recursoVazio);
        setSubmitted(false);
        setRecursoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setRecursoDialog(false);
    };

    const hideDeleteRecursoDialog = () => {
        setDeleteRecursoDialog(false);
    };

    const hideDeleteRecursosDialog = () => {
        setDeleteRecursosDialog(false);
    };

    const saveRecurso = () => {
        setSubmitted(true);
        if (!recurso.id) {
            recursoService.inserir(recurso)
                .then((response) => {
                    setRecursoDialog(false);
                    setRecurso(recursoVazio);
                    setRecursos(null);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso',
                        detail: 'Recurso cadastrado com Sucesso',

                    });
                })
                .catch((error) => {
                    console.log(error.data.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Há algo errado com o cadastro, verifique'

                    })
                });

        } else {
            recursoService.alterar(recurso)
                .then((response) => {
                    setRecursoDialog(false);
                    setRecurso(recursoVazio);
                    setRecursos(null);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso',
                        detail: 'Recurso alterado com Sucesso',

                    });
                }).catch((error) => {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Há algo errado com o recurso, verifique'

                    })
                })
        }
    };
    const editRecurso = (recurso: Projeto.Recurso) => {
        setRecurso({ ...recurso });
        setRecursoDialog(true);
    };

    const confirmDeleteRecurso = (recurso: Projeto.Recurso) => {
        setRecurso(recurso);
        setDeleteRecursoDialog(true);
    };

    const deleteRecurso = () => {
        if(recurso.id){
        recursoService.excluir(recurso.id).then((response) => {
            setRecurso(recursoVazio);
            setDeleteRecursoDialog(false);
            setRecursos(null);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Recurso Deletado com sucesso',
                life: 3000
            })

        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Ops, algo errado ao tentar deletar o Recurso, verifique',
                life: 3000
            })
        })
    }
    };

  

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteRecursosDialog(true);
    };

    const deleteSelectedRecursos = () => {

        
        Promise.all (selectedRecursos.map(async(_recurso) => {
            if (_recurso.id){
           await recursoService.excluir(_recurso.id)
      
        }
    })).then((response) =>{
        setRecursos(null)
        setSelectedRecursos([]);
        setDeleteRecursosDialog(false)
        toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Recursos Deletados com sucesso',
                life: 3000
            })
            
        }).catch ((error) =>{ 
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao Deletar Recurso',
                life: 3000
            })})
        }
  

 

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        //JEITO ANTIO, MOSTRANDO ERRO
        // let _recurso = { ...recurso };
        // _recurso[`${name}`] = val;

        // setRecurso(_recurso);
        //JEITO CERTOS
        setRecurso(prevRecurso =>({
             ...prevRecurso,
              [name]: val,
        }))
    };

   

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedRecursos || !(selectedRecursos as any).length} />
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

    const idBodyTemplate = (rowData: Projeto.Recurso) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
        );
    };

    const nomeBodyTemplate = (rowData: Projeto.Recurso) => {
        return (
            <>
                <span className="p-column-title">Nome</span>
                {rowData.nome}
            </>
        );
    };
    const chaveBodyTemplate = (rowData: Projeto.Recurso) => {
        return (
            <>
                <span className="p-column-title">Chave</span>
                {rowData.chave}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Projeto.Recurso) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editRecurso(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteRecurso(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamneto de Recursos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const recursoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveRecurso} />
        </>
    );
    
    const deleteRecursoDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteRecursoDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteRecurso} />
        </>
    );
    
    const deleteRecursosDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteRecursosDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedRecursos} />
        </>
    );
    

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={recursos}
                        selection={selectedRecursos}
                        onSelectionChange={(e) => setSelectedRecursos(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} do {totalRecords} recursos"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhum recurso ncontrado."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="Código" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nome" header="Nome" sortable body={nomeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="chave" header="Chave" sortable body={chaveBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>

                    <Dialog visible={recursoDialog} style={{ width: '450px' }} header="Detalhes de Recurso" modal className="p-fluid" footer={recursoDialogFooter} onHide={hideDialog}>

                        <div className="field">
                            <label htmlFor="nome">Nome</label>
                            <InputText
                                id="nome"
                                value={recurso.nome}
                                onChange={(e) => onInputChange(e, 'nome')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !recurso.nome
                                })}
                            />
                            {submitted && !recurso.nome && <small className="p-invalid">Recurso é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="chave">Chave</label>
                            <InputText
                                id="chave"
                                value={recurso.chave}
                                onChange={(e) => onInputChange(e, 'chave')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !recurso.chave
                                })}
                            />
                            {submitted && !recurso.chave && <small className="p-invalid">Chave é obrigatório.</small>}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteRecursoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteRecursoDialogFooter} onHide={hideDeleteRecursoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {recurso && (
                                <span>
                                    Tem Certeza que deseja excluir o recurso  <b>{recurso.nome}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteRecursosDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteRecursosDialogFooter} onHide={hideDeleteRecursoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {recurso && <span>Você quer mesmo excluir os recursos selecionados? </span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Recurso;
