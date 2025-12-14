package ec.edu.espe.mscatalogo.services;

import ec.edu.espe.mscatalogo.models.entities.Medicamento;
import java.util.List;
import java.util.Optional;

public interface MedicamentoService {
    List<Medicamento> listarTodos();
    Optional<Medicamento> buscarPorId(Long id);
    Medicamento guardar(Medicamento medicamento);
    void eliminar(Long id);
}