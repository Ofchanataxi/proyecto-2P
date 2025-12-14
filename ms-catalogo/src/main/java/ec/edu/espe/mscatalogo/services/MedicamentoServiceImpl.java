package ec.edu.espe.mscatalogo.services;

import ec.edu.espe.mscatalogo.models.entities.Medicamento;
import ec.edu.espe.mscatalogo.repositories.MedicamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicamentoServiceImpl implements MedicamentoService {

    @Autowired
    private MedicamentoRepository repository;

    @Override
    public List<Medicamento> listarTodos() {
        return (List<Medicamento>) repository.findAll();
    }

    @Override
    public Optional<Medicamento> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Override
    public Medicamento guardar(Medicamento medicamento) {
        return repository.save(medicamento);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}