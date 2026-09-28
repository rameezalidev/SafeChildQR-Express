import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

type Child = {
  id: string;
  name: string;
  age: number;
  gender: string;
  info: string;
  parentId: string;
};

type FormValues = {
  name: string;
  age: string;
  gender: string;
  info: string;
};

function Dashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState<Child[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  /*
   * Fetch children when dashboard loads
   */
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    async function fetchChildren() {
      try {
        const response = await fetch(
          'http://localhost:3000/api/children',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
            return;
          }

          toast.error(data.message || 'Failed to load children');
          return;
        }

        setUserData(data);
      } catch (error) {
        console.error(error);
        toast.error('Unable to connect to server');
      }
    }

    fetchChildren();
  }, [navigate]);

  /*
   * Formik
   */
  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      age: '',
      gender: '',
      info: '',
    },

    validate: (values) => {
      const errors: {
        name?: string;
        age?: string;
        gender?: string;
        info?: string;
      } = {};

      if (!values.name.trim()) {
        errors.name = 'Name is required';
      } else if (values.name.trim().length < 3) {
        errors.name = 'Name must be at least 3 characters';
      }

      if (!values.age) {
        errors.age = 'Age is required';
      } else if (Number(values.age) < 1) {
        errors.age = 'Age must be at least 1';
      } else if (Number(values.age) > 18) {
        errors.age = 'Age must be 18 or below';
      }

      if (!values.gender) {
        errors.gender = 'Gender is required';
      }

      if (!values.info.trim()) {
        errors.info = 'Information is required';
      } else if (values.info.trim().length < 10) {
        errors.info = 'Information must be at least 10 characters';
      }

      return errors;
    },

    onSubmit: async (values) => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      const childData = {
        name: values.name.trim(),
        age: Number(values.age),
        gender: values.gender,
        info: values.info.trim(),
      };

      /*
       * UPDATE CHILD
       */
      if (editId !== null) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/children/${editId}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(childData),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem('token');
              navigate('/login', { replace: true });
              return;
            }

            toast.error(data.message || 'Failed to update child');
            return;
          }

          setUserData((prevChildren) =>
            prevChildren.map((child) =>
              child.id === editId ? data.child : child
            )
          );

          toast.success('Child updated successfully');

          setEditId(null);
          formik.resetForm();
        } catch (error) {
          console.error(error);
          toast.error('Unable to connect to server');
        }

        return;
      }

      /*
       * ADD CHILD
       */

      const isDuplicate = userData.some(
        (child) =>
          child.name.toLowerCase() === childData.name.toLowerCase()
      );

      if (isDuplicate) {
        toast.error('This child already exists');
        return;
      }

      try {
        const response = await fetch(
          'http://localhost:3000/api/children',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(childData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
            return;
          }

          toast.error(data.message || 'Failed to add child');
          return;
        }

        setUserData((prevChildren) => [
          ...prevChildren,
          data,
        ]);

        toast.success('Child added successfully');

        formik.resetForm();
      } catch (error) {
        console.error(error);
        toast.error('Unable to connect to server');
      }
    },
  });

  /*
   * DELETE CHILD
   */
  async function deleteChild(id: string) {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/children/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
          return;
        }

        toast.error(data.message || 'Failed to delete child');
        return;
      }

      setUserData((prevChildren) =>
        prevChildren.filter((child) => child.id !== id)
      );

      if (editId === id) {
        setEditId(null);
        formik.resetForm();
      }

      toast.success('Child deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Unable to connect to server');
    }
  }

  /*
   * EDIT CHILD
   */
  function editChild(child: Child) {
    formik.setValues({
      name: child.name,
      age: String(child.age),
      gender: child.gender,
      info: child.info,
    });

    setEditId(child.id);
  }

  /*
   * CANCEL EDIT
   */
  function cancelEdit() {
    setEditId(null);

    formik.resetForm({
      name: '',
      age: '',
      gender: '',
      info: '',
    });
  }

  /*
   * LOGOUT
   */
  function handleLogout() {
    localStorage.removeItem('token');

    toast.success('Logged out successfully');

    navigate('/login', {
      replace: true,
    });
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">

        <header className="dashboard-header">
          <div>
            <p className="eyebrow">SafeChildQR</p>
            <h2>Parent Dashboard</h2>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <div className="dashboard-grid">

          {/* =========================
              CHILD FORM
          ========================= */}
          <form
            onSubmit={formik.handleSubmit}
            className="child-form-card"
          >
            <h3>
              {editId !== null
                ? 'Update Child Record'
                : 'Add Child Record'}
            </h3>

            <div className="child-data-input">

              {/* NAME */}
              <label>
                <span>Name</span>

                <input
                  type="text"
                  name="name"
                  placeholder="Child name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </label>

              {formik.touched.name && formik.errors.name && (
                <p className="error">
                  {formik.errors.name}
                </p>
              )}

              {/* AGE */}
              <label>
                <span>Age</span>

                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </label>

              {formik.touched.age && formik.errors.age && (
                <p className="error">
                  {formik.errors.age}
                </p>
              )}

              {/* GENDER */}
              <label>
                <span>Gender</span>

                <select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">
                    Select Gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </label>

              {formik.touched.gender && formik.errors.gender && (
                <p className="error">
                  {formik.errors.gender}
                </p>
              )}

              {/* INFORMATION */}
              <label>
                <span>Information</span>

                <textarea
                  name="info"
                  placeholder="Any medical or safety details"
                  value={formik.values.info}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </label>

              {formik.touched.info && formik.errors.info && (
                <p className="error">
                  {formik.errors.info}
                </p>
              )}

              {/* BUTTONS */}
              <div className="form-actions">

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={
                    editId !== null && !formik.dirty
                  }
                >
                  {editId !== null
                    ? 'Update Child'
                    : 'Add Child'}
                </button>

                {editId !== null && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </div>
          </form>

          {/* =========================
              CHILDREN LIST
          ========================= */}
          <div className="child-container">

            <h3>
              Children List
            </h3>

            {userData.length > 0 ? (

              userData.map((child) => (

                <div
                  key={child.id}
                  className="child-card"
                >

                  <div className="child-card-head">

                    <h4>
                      {child.name}
                    </h4>

                    <span>
                      {child.age} yrs
                    </span>

                  </div>

                  <p>
                    <strong>
                      Gender:
                    </strong>{' '}
                    {child.gender}
                  </p>

                  <p>
                    <strong>
                      Info:
                    </strong>{' '}
                    {child.info}
                  </p>

                  <div className="child-actions">

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => editChild(child)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => deleteChild(child.id)}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))

            ) : (

              <p className="empty-state">
                No children added yet.
              </p>

            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
