import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Nav from './features/navigation/Nav';
import Modal from './features/modal/Modal';

function App() {
  const [modalOpen, setModalOpen] = useState(false);

  const close = () => setModalOpen(false);
  const open = () => setModalOpen(true);

  return (
    <>
      <div className="container">
        <Nav handleOpenModal={open}/>
      </div>

      <AnimatePresence
        initial={false}
        exitBeforeEnter={true}
      >
        {modalOpen && <Modal modalOpen={modalOpen} handleClose={close} />}
      </AnimatePresence>
    </>
  );
}

export default App;
