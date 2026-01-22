package ec.edu.espe.msinventario.services;

import ec.edu.espe.msinventario.models.entities.Inventario;

import java.util.List;
import java.util.Optional;

public interface InventarioService {
    Inventario asignarStock(Inventario inventario);

    Inventario actualizarStock(Long id, Integer nuevaCantidad);

    Optional<Inventario> buscarPorId(Long id);

    Optional<Inventario> buscarPorSucursalYMedicamento(Long sucursalId, Long medicamentoId);

    void descontarStock(Long sucursalId, Long medicamentoId, Integer cantidad);

    List<Inventario> listarTodos();

    List<Inventario> listarPorSucursal(Long sucursalId);
}
