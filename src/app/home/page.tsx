"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Box,
  IconButton,
  Paper,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import axios, { AxiosResponse } from "axios";
import utilsFunc from "../services/global";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, Delete } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useRouter } from "next/navigation";
const { headerConfig } = utilsFunc;

interface Todo {
  _id: string;
  no: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [typeAction, setTypeAction] = useState<number>(0); // 0 = create 1 = edit or update
  const [todoID, setTodoID] = useState<string | undefined>();
  const router = useRouter();

  useEffect(() => {
    getTodo();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "no",
      headerName: "No.",
      width: 150,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Updated Date",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div>
          <Button>
            <Edit onClick={() => handleOpenModal(1, params.row.id)} />
          </Button>
          <Button onClick={() => handleDelete(params.row.id, params.row.title)}>
            <Delete />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = (id: string, title: string) => {
    const confirmDelete = () => {
      if (window.confirm(`Want delete ${title}`)) {
        deleteTodo(id);
      }
    };
    confirmDelete();
  };

  const deleteTodo = (id: string) => {
    const headers = headerConfig();
    axios
      .delete(`https://candidate.neversitup.com/todo/todos/${id}`, {
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200 || res.status === 204) {
          getTodo();
        } else {
          throw new Error("Delete failed");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getTodo = () => {
    const headers = headerConfig();
    axios
      .get<Todo[]>("https://candidate.neversitup.com/todo/todos/", {
        headers: headers,
      })
      .then((response: AxiosResponse<Todo[]>) => {
        const result = response.data.map((ele, i) => ({
          ...ele,
          id: ele._id,
          no: i + 1,
        }));
        setTodoList(result);
      });
  };

  const getTodoById = (id: string) => {
    const headers = headerConfig();
    axios
      .get<Todo>(`https://candidate.neversitup.com/todo/todos/${id}`, {
        headers: headers,
      })
      .then((response: AxiosResponse<Todo>) => {
        const result = response.data;
        setTitle(result.title);
        setDescription(result.description);
      });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTitle("");
    setDescription("");
  };

  const handleOpenModal = (typeNumber: number, id: string) => {
    if (typeNumber === 1) {
      setTodoID(id);
      getTodoById(id);
    } else {
      setTitle("");
      setDescription("");
    }
    setTypeAction(typeNumber);
    setOpenModal(true);
  };

  const handleActions = () => {
    switch (typeAction) {
      case 0:
        handleCreate();
        break;
      case 1:
        handleEdit();
        break;
    }
  };

  const handleCreate = () => {
    const payload = {
      title: title,
      description: description,
    };
    const headers = headerConfig();
    axios
      .post("https://candidate.neversitup.com/todo/todos/", payload, {
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200 || res.status === 204) {
          getTodo();
          setOpenModal(false);
          setTitle("");
          setDescription("");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleEdit = () => {
    const payload = {
      title: title,
      description: description,
    };
    const headers = headerConfig();
    axios
      .put(`https://candidate.neversitup.com/todo/todos/${todoID}`, payload, {
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200 || res.status === 204) {
          getTodo();
          setOpenModal(false);
          setTitle("");
          setDescription("");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 15 }}>
        <Box sx={{ my: 3, display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" onClick={() => handleOpenModal(0, "")}>
            Create
          </Button>
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        <DataGrid rows={todoList} columns={columns} pageSize={5} />
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={styleModal} component="form">
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Title"
              name="title"
              autoComplete="title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="description"
              label="Description"
              id="description"
              autoComplete="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Box>
              <Button
                variant="contained"
                sx={{ mr: 3 }}
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ mr: 3 }}
                onClick={handleActions}
              >
                {typeAction === 0 ? "Create" : "Update"}
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </>
  );
}
